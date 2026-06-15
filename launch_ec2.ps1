$ErrorActionPreference = "Stop"

$AWS = "C:\Program Files\Amazon\AWSCLIV2\aws.exe"

Write-Host "Generating Presigned URL for EC2 download..."
$PRESIGNED_URL = & $AWS s3 presign "s3://cymed-deployment-bucket-25567/cymed_deployment.zip" --expires-in 3600

Write-Host "Finding Amazon Linux 2023 AMI..."
$AMI_ID = & $AWS ssm get-parameters --names /aws/service/ami-amazon-linux-latest/al2023-ami-kernel-6.1-x86_64 --query 'Parameters[0].Value' --output text

Write-Host "Preparing UserData script..."
$USER_DATA = @"
#!/bin/bash
dnf update -y
dnf install docker -y
systemctl start docker
systemctl enable docker
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-Linux-x86_64" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
mkdir /app
cd /app
wget -O cymed.zip "$PRESIGNED_URL"
unzip cymed.zip
docker-compose up --build -d
"@

$USER_DATA_BYTES = [System.Text.Encoding]::UTF8.GetBytes($USER_DATA)
$USER_DATA_B64 = [System.Convert]::ToBase64String($USER_DATA_BYTES)

Write-Host "Launching EC2 Instance (t3.micro Free Tier)..."
$RUN_CMD = & $AWS ec2 run-instances --image-id $AMI_ID --instance-type t3.micro --key-name cymed-key --security-groups cymed-sg --user-data $USER_DATA_B64 --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=CyMed-Server}]'
$INSTANCE_ID = ($RUN_CMD | ConvertFrom-Json).Instances[0].InstanceId

Write-Host "Waiting for instance $INSTANCE_ID to initialize..."
Start-Sleep -Seconds 15

$PUBLIC_IP = & $AWS ec2 describe-instances --instance-ids $INSTANCE_ID --query 'Reservations[0].Instances[0].PublicIpAddress' --output text

Write-Host "=========================================="
Write-Host "DEPLOYMENT INITIATED SUCCESSFULLY!"
Write-Host "Instance ID: $INSTANCE_ID"
Write-Host "Public IP: $PUBLIC_IP"
Write-Host "=========================================="
Write-Host "Please note: The server needs about 3-5 minutes to install Docker, download the code, build the images, and start the applications."
Write-Host "Frontend will be available at: http://$PUBLIC_IP:3000"
Write-Host "Backend API will be available at: http://$PUBLIC_IP:8000"

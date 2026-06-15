import subprocess
import json
import base64
import time

def run_cmd(cmd):
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error running: {cmd}\n{result.stderr}")
    return result.stdout.strip()

print("Getting Presigned URL...")
url = run_cmd('"C:\\Program Files\\Amazon\\AWSCLIV2\\aws.exe" s3 presign s3://cymed-deployment-bucket-61211/cymed_deployment.zip --expires-in 3600')

print("Fetching AMI ID...")
ami_id = run_cmd('"C:\\Program Files\\Amazon\\AWSCLIV2\\aws.exe" ssm get-parameters --names /aws/service/ami-amazon-linux-latest/al2023-ami-kernel-6.1-x86_64 --query "Parameters[0].Value" --output text')

user_data = f"""#!/bin/bash
dnf update -y
dnf install docker -y
systemctl start docker
systemctl enable docker
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-Linux-x86_64" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
mkdir /app
cd /app
wget -O cymed.zip "{url}"
unzip cymed.zip
DOCKER_BUILDKIT=0 docker-compose up --build -d
"""
user_data_b64 = base64.b64encode(user_data.encode('utf-8')).decode('utf-8')

print("Launching EC2...")
run_cmd_str = f'"C:\\Program Files\\Amazon\\AWSCLIV2\\aws.exe" ec2 run-instances --image-id {ami_id} --instance-type t3.micro --security-groups cymed-sg --user-data {user_data_b64} --tag-specifications "ResourceType=instance,Tags=[{{Key=Name,Value=CyMed-Server}}]"'
output = run_cmd(run_cmd_str)
try:
    instance_id = json.loads(output)['Instances'][0]['InstanceId']
    print(f"Instance started: {instance_id}")
    time.sleep(15)
    ip = run_cmd(f'"C:\\Program Files\\Amazon\\AWSCLIV2\\aws.exe" ec2 describe-instances --instance-ids {instance_id} --query "Reservations[0].Instances[0].PublicIpAddress" --output text')
    print("==========================================")
    print("DEPLOYMENT INITIATED SUCCESSFULLY!")
    print(f"Instance ID: {instance_id}")
    print(f"Public IP: {ip}")
    print("==========================================")
except Exception as e:
    print(f"Failed to parse instance ID: {e}\nOutput: {output}")

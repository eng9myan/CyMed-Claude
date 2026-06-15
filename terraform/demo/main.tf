terraform {
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.0" }
  }
}

provider "aws" {
  region = var.aws_region
}

# ── ECR Repositories ──────────────────────────────────────────────────────────

resource "aws_ecr_repository" "backend" {
  name                 = "cymed-backend"
  image_tag_mutability = "MUTABLE"
  force_delete         = true
  image_scanning_configuration { scan_on_push = true }
}

resource "aws_ecr_repository" "frontend" {
  name                 = "cymed-frontend"
  image_tag_mutability = "MUTABLE"
  force_delete         = true
  image_scanning_configuration { scan_on_push = true }
}

# ── IAM: EC2 can pull from ECR + be managed by SSM ───────────────────────────

resource "aws_iam_role" "ec2_role" {
  name = "cymed-demo-ec2-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{ Effect = "Allow", Principal = { Service = "ec2.amazonaws.com" }, Action = "sts:AssumeRole" }]
  })
}

resource "aws_iam_role_policy_attachment" "ecr_read" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

resource "aws_iam_role_policy_attachment" "ssm_core" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_instance_profile" "ec2_profile" {
  name = "cymed-demo-ec2-profile"
  role = aws_iam_role.ec2_role.name
}

# ── Security Group ────────────────────────────────────────────────────────────

resource "aws_security_group" "cymed_sg" {
  name        = "cymed-demo-sg"
  description = "CyMed demo server"

  ingress { from_port = 80,  to_port = 80,  protocol = "tcp", cidr_blocks = ["0.0.0.0/0"] }
  ingress { from_port = 443, to_port = 443, protocol = "tcp", cidr_blocks = ["0.0.0.0/0"] }
  ingress { from_port = 22,  to_port = 22,  protocol = "tcp", cidr_blocks = ["0.0.0.0/0"] }
  egress  { from_port = 0,   to_port = 0,   protocol = "-1",  cidr_blocks = ["0.0.0.0/0"] }
}

# ── EC2 Instance ──────────────────────────────────────────────────────────────

data "aws_ami" "amazon_linux_2023" {
  most_recent = true
  owners      = ["amazon"]
  filter { name = "name",                values = ["al2023-ami-*-x86_64"] }
  filter { name = "virtualization-type", values = ["hvm"] }
}

resource "aws_instance" "cymed" {
  ami                    = data.aws_ami.amazon_linux_2023.id
  instance_type          = var.instance_type
  iam_instance_profile   = aws_iam_instance_profile.ec2_profile.name
  vpc_security_group_ids = [aws_security_group.cymed_sg.id]
  key_name               = var.key_name

  root_block_device { volume_size = 30, volume_type = "gp3" }

  user_data = templatefile("${path.module}/userdata.sh", {
    aws_region       = var.aws_region
    backend_ecr_url  = aws_ecr_repository.backend.repository_url
    frontend_ecr_url = aws_ecr_repository.frontend.repository_url
    domain           = var.domain
    certbot_email    = var.certbot_email
    db_password      = var.db_password
    secret_key       = var.secret_key
  })

  tags = { Name = "cymed-demo" }
}

resource "aws_eip" "cymed" {
  instance = aws_instance.cymed.id
  domain   = "vpc"
  tags     = { Name = "cymed-demo-eip" }
}

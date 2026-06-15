terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# VPC Configuration
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.0.0"

  name = "cymed-vpc"
  cidr = "10.0.0.0/16"

  azs             = ["${var.aws_region}a", "${var.aws_region}b"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24"]

  enable_nat_gateway = true
  single_nat_gateway = true
}

# ECS Cluster for CyMed Platform (Django Backend & Next.js Frontend)
resource "aws_ecs_cluster" "cymed_cluster" {
  name = "cymed-production-cluster"
}

# RDS PostgreSQL Database
resource "aws_db_instance" "cymed_db" {
  identifier        = "cymed-db"
  engine            = "postgres"
  engine_version    = "15.4"
  instance_class    = "db.t4g.large"
  allocated_storage = 50
  
  db_name  = "cymed_db"
  username = var.db_username
  password = var.db_password
  
  vpc_security_group_ids = [aws_security_group.db_sg.id]
  db_subnet_group_name   = module.vpc.database_subnet_group_name
  
  skip_final_snapshot = false
  publicly_accessible = false
}

# Redis Cluster for WebSockets / Cache
resource "aws_elasticache_cluster" "cymed_redis" {
  cluster_id           = "cymed-redis"
  engine               = "redis"
  node_type            = "cache.t4g.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  engine_version       = "7.0"
  port                 = 6379
  
  security_group_ids   = [aws_security_group.redis_sg.id]
  subnet_group_name    = aws_elasticache_subnet_group.redis_subnet.name
}

resource "aws_elasticache_subnet_group" "redis_subnet" {
  name       = "cymed-redis-subnet"
  subnet_ids = module.vpc.private_subnets
}

# Security Groups
resource "aws_security_group" "db_sg" {
  name        = "cymed-db-sg"
  description = "Allow inbound traffic from ECS"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_sg.id]
  }
}

resource "aws_security_group" "redis_sg" {
  name        = "cymed-redis-sg"
  description = "Allow inbound traffic from ECS"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_sg.id]
  }
}

resource "aws_security_group" "ecs_sg" {
  name        = "cymed-ecs-sg"
  description = "Allow inbound HTTP/HTTPS traffic"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

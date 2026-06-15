variable "aws_region"     { default = "us-east-1" }
variable "instance_type"  { default = "t3.small" }
variable "domain"         { default = "cymed.cy-com.com" }
variable "certbot_email"  { default = "m.alnsour@outlook.com" }
variable "key_name"       { description = "EC2 key pair name for SSH access" }
variable "db_password"    { sensitive = true }
variable "secret_key"     { sensitive = true }

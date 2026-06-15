output "public_ip"        { value = aws_eip.cymed.public_ip }
output "instance_id"      { value = aws_instance.cymed.id }
output "backend_ecr_url"  { value = aws_ecr_repository.backend.repository_url }
output "frontend_ecr_url" { value = aws_ecr_repository.frontend.repository_url }
output "dns_instruction"  { value = "Point cymed.cy-com.com A record → ${aws_eip.cymed.public_ip}" }

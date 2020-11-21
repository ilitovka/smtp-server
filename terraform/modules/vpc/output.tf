output "ecs_tasks_security_group" {
    value = aws_security_group.ecs_tasks
}

output "redis_security_group" {
    value = aws_security_group.redis
}

output "private_subnets" {
    value = aws_subnet.private
}

output "lb-mail" {
    value = aws_lb.mail
}

output "lb_target_group-mail" {
    value = aws_lb_target_group.mail
}

output "lb_listener-mail" {
    value = aws_alb_listener.mail
}
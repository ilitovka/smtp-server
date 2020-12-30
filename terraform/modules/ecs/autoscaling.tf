
resource "aws_appautoscaling_target" "app_scale_target" {
  count              = var.autoscale_enabled == "true" ? 1 : 0

  service_namespace  = "ecs"
  resource_id        = "service/${aws_ecs_cluster.app.name}/${aws_ecs_service.app.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  max_capacity       = var.ecs_autoscale_max_instances
  min_capacity       = var.ecs_autoscale_min_instances
  tags = var.common_tags
}


resource "aws_appautoscaling_policy" "ecs_policy_cpu" {
  count              = var.autoscale_enabled == "true" ? 1 : 0

  name               = "cpu-autoscaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = element(aws_appautoscaling_target.app_scale_target.*.resource_id, count.index)
  scalable_dimension = element(aws_appautoscaling_target.app_scale_target.*.scalable_dimension, count.index)
  service_namespace  = element(aws_appautoscaling_target.app_scale_target.*.service_namespace, count.index)
 
  target_tracking_scaling_policy_configuration {
   predefined_metric_specification {
     predefined_metric_type = "ECSServiceAverageCPUUtilization"
   }
 
   target_value       = var.autoscaling_cpu_target_value
  }
}

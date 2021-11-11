# Sends notificatiion to Slack when ECS task count reach max autoscaling limit 
provider "aws" {
  alias  = "virginia"
  region = "us-east-1"
}

resource "aws_sns_topic" "ecs_autoscaling_alerts" {
  name = "${var.environment}-${var.region}-ecs-autoscaling-slack-alerts"
  tags = var.common_tags
}

resource "aws_sns_topic_subscription" "ecs_autoscaling_alerts_target" {
  topic_arn = aws_sns_topic.ecs_autoscaling_alerts.arn
  protocol  = "lambda"
  endpoint  = var.sns2slack_lambda_function_arn
}

resource "aws_lambda_permission" "with_sns" {
  statement_id  = "AllowExecutionFromSNSNew"
  action        = "lambda:InvokeFunction"
  function_name = var.sns2slack_lambda_function_name
  principal     = "sns.amazonaws.com"
  source_arn    = aws_sns_topic.ecs_autoscaling_alerts.arn
  provider      = aws.virginia

}

resource "aws_cloudwatch_metric_alarm" "autoscaling_limit_alarm" {
  alarm_name          = "${var.environment}-${var.region}-ecs-autoscaling-alarm"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = "1"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = "60"
  statistic           = "SampleCount"
  threshold           = var.ecs_autoscaler_threshold

  dimensions = {
    ClusterName = "${var.app}-${var.environment}"
    ServiceName = "${var.app}-${var.environment}"
  }

  alarm_description         = "*${var.environment}*: ${var.region}.${var.app_domain_name}"
  alarm_actions             = [aws_sns_topic.ecs_autoscaling_alerts.arn]
  ok_actions                = [aws_sns_topic.ecs_autoscaling_alerts.arn]
  insufficient_data_actions = []

  # depends_on          = []

  tags = var.common_tags
}
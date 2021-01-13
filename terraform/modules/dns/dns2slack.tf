#AWS Route 53 Health check service is only available in us-east-1
provider "aws" {
  alias  = "virginia"
  region = "us-east-1"
}

resource "aws_iam_role" "iam_lambda_role" {
  name = "${var.environment}-${var.region}-sns2slack-lambda-role"
  provider  = aws.virginia
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

resource "aws_lambda_function" "sns2slack_lambda" {
  filename      = "../../modules/dns/sns2slack.py.zip"
  function_name = "${var.environment}-${var.region}-sns2slack-lambda"
  role          = aws_iam_role.iam_lambda_role.arn
  handler       = "sns2slack.lambda_handler"
  runtime       = "python3.6"
  provider  = aws.virginia
  environment {
    variables = {
      slack_url = var.SLACK_NOTIFICATION_URL
      slack_channel = var.SLACK_CHANNEL
      slack_username = var.SLACK_USERNAME
    }
  }
}

resource "aws_sns_topic" "route53_alerts" {
  name = "${var.environment}-${var.region}-route53-slack-alerts"
  provider  = aws.virginia
}

resource "aws_sns_topic_subscription" "route53_alerts_target" {
  topic_arn = aws_sns_topic.route53_alerts.arn
  protocol  = "lambda"
  provider  = aws.virginia
  endpoint  = aws_lambda_function.sns2slack_lambda.arn
}

resource "aws_lambda_permission" "with_sns" {
  statement_id  = "AllowExecutionFromSNS"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.sns2slack_lambda.function_name
  principal     = "sns.amazonaws.com"
  source_arn    = aws_sns_topic.route53_alerts.arn
  provider  = aws.virginia
}

resource "aws_cloudwatch_metric_alarm" "cw_metric_alarm" {
  alarm_name          = "${var.environment}-${var.region}-route53-alarm"
  namespace           = "AWS/Route53"
  metric_name         = "HealthCheckStatus"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = "1"
  period              = "60"
  statistic           = "Minimum"
  threshold           = "1"
  unit                = "None"
  provider            = aws.virginia
  dimensions          = {
    HealthCheckId = aws_route53_health_check.check.id
  }
  alarm_description   = "*${var.environment}*: ${var.region}.${var.app_domain_name}"
  alarm_actions       = [aws_sns_topic.route53_alerts.arn]
  ok_actions          = [aws_sns_topic.route53_alerts.arn]
  insufficient_data_actions = []
  depends_on          = [aws_route53_health_check.check]
}
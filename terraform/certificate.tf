locals {
  app_env_domain_name = "${terraform.workspace}" == "prod" ? var.app_domain_name : "${terraform.workspace}.${var.app_domain_name}"
}

resource "aws_acm_certificate" "cert" {
  domain_name       = local.app_env_domain_name
  validation_method = "DNS"

  tags = {
    Environment = local.environment
  }

  lifecycle {
    create_before_destroy = true
  }
}

data "aws_route53_zone" "zone" {
  name         = var.domain_name_zone
  private_zone = false
}

resource "aws_route53_record" "cert_validation" {
  name    = aws_acm_certificate.cert.domain_validation_options.0.resource_record_name

  type    = aws_acm_certificate.cert.domain_validation_options.0.resource_record_type
  zone_id = data.aws_route53_zone.zone.id
  records = [aws_acm_certificate.cert.domain_validation_options.0.resource_record_value]
  ttl     = 60
}

resource "aws_acm_certificate_validation" "cert" {
  certificate_arn         = aws_acm_certificate.cert.arn
  validation_record_fqdns = [aws_route53_record.cert_validation.fqdn]
}

# API record
resource "aws_route53_record" "api" {
  zone_id = data.aws_route53_zone.zone.id
  name = local.app_env_domain_name
  type    = "A"

  alias {
    name = aws_lb.api.dns_name
    zone_id = aws_lb.api.zone_id

    evaluate_target_health = false
  }
}

# Mail record
resource "aws_route53_record" "mail" {
  zone_id = data.aws_route53_zone.zone.id
  name = local.app_env_domain_name
  type    = "MX"
  ttl = "300"

  records = [
    "10 ${aws_lb.mail.dns_name}."
  ]
}

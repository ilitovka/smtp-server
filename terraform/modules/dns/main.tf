
data "aws_route53_zone" "zone" {
  name         = var.domain_name_zone
  private_zone = false
}

resource "aws_route53_health_check" "check" {

  fqdn              = var.lb-mail.dns_name
  port              = "25"
  type              = "TCP"
  failure_threshold = "3"
  request_interval  = "30"
  tags = merge(var.common_tags, {
    Name = "${var.region}.${var.app_domain_name}"
  })

}

resource "aws_route53_record" "mail" {

  zone_id = data.aws_route53_zone.zone.id
  name    = var.app_domain_name
  type    = "MX"
  ttl     = var.dns_record_ttl

  health_check_id = aws_route53_health_check.check.id

  latency_routing_policy  {
    region = var.region
  }

  set_identifier = "latency-${var.region}"

  records = [
    "10 ${var.lb-mail.dns_name}."
  ]
}
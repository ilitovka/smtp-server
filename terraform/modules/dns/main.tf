locals {
    region_continent_map = {
        "us-west-1" = "NA"
        "us-west-2" = "NA"
        "us-east-1" = "NA"
        "us-east-2" = "NA"
        "ca-central-1" = "NA"

        "sa-east-1" = "SA"
        
        "eu-central-1" = "EU"
        "eu-west-1" = "EU"
        "eu-west-2" = "EU"
        "eu-west-3" = "EU"
        "eu-north-1" = "EU"
        "eu-south-1" = "EU"

        "me-south-1" = "AS"
        "ap-east-1" = "AS"
        "ap-south-1" = "AS"
        "ap-northeast-1" = "AS"
        "ap-northeast-2" = "AS"
        "ap-southeast-1" = "AS"
        "ap-southeast-2" = "AS"

        "af-south-1" = "AF"
    }

}



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

  tags = {
    Name = "${var.region}.${var.app_domain_name}"
  }

}

resource "aws_route53_record" "mail-geo" {

  zone_id = data.aws_route53_zone.zone.id
  name    = var.app_domain_name
  type    = "MX"
  ttl     = var.dns_record_ttl

  health_check_id = aws_route53_health_check.check.id

  geolocation_routing_policy  {
    continent = local.region_continent_map[var.region]
  }

  set_identifier = "geo-${var.region}"

  records = [
    "10 ${var.lb-mail.dns_name}."
  ]
}

resource "aws_route53_record" "mail-geo-default" {
  # current region has to match failover region
  # then create this resource
  count = var.primary_region == var.region? 1: 0

  zone_id = data.aws_route53_zone.zone.id
  name    = var.app_domain_name
  type    = "MX"
  ttl     = var.dns_record_ttl

  health_check_id = aws_route53_health_check.check.id

  geolocation_routing_policy  {
    country = "*"
  }

  set_identifier = "geo-default-${var.region}"

  records = [
    "10 ${var.lb-mail.dns_name}."
  ]
}



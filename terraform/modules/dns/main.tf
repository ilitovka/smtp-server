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

    failover_type = var.region == var.failover_primary_region ? "PRIMARY": "SECONDARY"
}



data "aws_route53_zone" "zone" {
  name         = var.domain_name_zone
  private_zone = false
}

resource "aws_route53_health_check" "check" {
  count = var.failover_primary_region != "" ? 1: 0

  fqdn              = var.lb-mail.dns_name
  port              = "25"
  type              = "TCP"
  failure_threshold = "3"
  request_interval  = "30"

}

resource "aws_route53_record" "mail-failover" {
  count = var.failover_primary_region != "" ? 1: 0

  zone_id = data.aws_route53_zone.zone.id
  name    = "${var.region}.${var.app_domain_name}"
  type    = "MX"
  ttl     = var.dns_record_ttl

  health_check_id = aws_route53_health_check.check[count.index].id
  

  failover_routing_policy  {
    type = local.failover_type
  }

  set_identifier = "failover-${var.region}"

  records = [
    "10 ${var.lb-mail.dns_name}."
  ]
}


resource "aws_route53_record" "mail-geo" {
  count = var.failover_primary_region != "" ? 1: 0

  zone_id = data.aws_route53_zone.zone.id
  name    = var.app_domain_name
  type    = "MX"

  geolocation_routing_policy  {
    continent = local.region_continent_map[var.region]
  }

  set_identifier = "geo-${var.region}"

   alias {
     name = aws_route53_record.mail-failover[count.index].name
     zone_id = data.aws_route53_zone.zone.id

     evaluate_target_health = true
   }
}

resource "aws_route53_record" "mail-geo-default" {
  # current region has to match failover region
  # then create this resource
  count = var.failover_primary_region == var.region? 1: 0

  zone_id = data.aws_route53_zone.zone.id
  name    = var.app_domain_name
  type    = "MX"

  geolocation_routing_policy  {
    country = "*"
  }

  set_identifier = "geo-default-${var.region}"

   alias {
     name = aws_route53_record.mail-failover[count.index].name
     zone_id = data.aws_route53_zone.zone.id

     evaluate_target_health = true
   }
}


resource "aws_route53_record" "mail" {
  # in case of no failover set create this resource
  count = var.failover_primary_region != "" ? 0: 1

  zone_id = data.aws_route53_zone.zone.id
  name    = var.app_domain_name
  type    = "MX"
  ttl = var.dns_record_ttl

  records = [
    "10 ${var.lb-mail.dns_name}."
  ]
}

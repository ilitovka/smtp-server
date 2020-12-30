resource "aws_elasticache_subnet_group" "private" {
  name       = "${var.app}-${var.environment}-subnet-group"
  subnet_ids = var.private_subnets.*.id
  tags = var.common_tags
}

resource "aws_elasticache_security_group" "sg" {
  name                 = "${var.app}-${var.environment}-security-group"
  security_group_names = [ var.redis_security_group.id ]
  tags = var.common_tags
}

resource "aws_elasticache_cluster" "redis" {
  cluster_id           = "${var.app}-${var.environment}-cluster"

  subnet_group_name    = aws_elasticache_subnet_group.private.name
  security_group_ids   = aws_elasticache_security_group.sg.security_group_names

  engine               = "redis"
  node_type            = "cache.t3.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis3.2"
  engine_version       = "3.2.10"
  port                 = 6379
  tags = var.common_tags
}
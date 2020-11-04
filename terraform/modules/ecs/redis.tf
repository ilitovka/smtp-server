resource "aws_elasticache_subnet_group" "private" {
  name       = "tf-test-cache-subnet"
  subnet_ids = var.private_subnets.*.id
}

resource "aws_elasticache_cluster" "redis" {
  cluster_id           = "${var.app}-${var.environment}-cluster"
  subnet_group_name    = aws_elasticache_subnet_group.private.name

  engine               = "redis"
  node_type            = "cache.t2.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis3.2"
  engine_version       = "3.2.10"
  port                 = 6379
}
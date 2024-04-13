broker_url = "redis://localhost/1",
result_backend = "redis://localhost/2",
timezone = "Asia/kolkata",
broker_connection_retry_on_startup=True,
worker_cancel_long_running_tasks_on_connection_loss=True
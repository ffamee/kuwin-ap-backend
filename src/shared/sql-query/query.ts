const configCount = 'COUNT(configuration.id)';

const downCount =
  "SUM(CASE WHEN configuration.lastSeenAt < NOW() - INTERVAL 5 MINUTE OR configuration.status IN ('DOWN', 'DOWNLOAD', 'MAINTENANCE', 'PENDING') THEN 1 ELSE 0 END)";

const maCount =
  "SUM(CASE WHEN configuration.status = 'MAINTENANCE' THEN 1 ELSE 0 END)";

const c24Count =
  "SUM(CASE WHEN configuration.lastSeenAt >= NOW() - INTERVAL 5 MINUTE AND configuration.status NOT IN ('PENDING', 'MAINTENANCE', 'DOWN', 'DOWNLOAD') THEN configuration.client_24 ELSE 0 END)";

const c5Count =
  "SUM(CASE WHEN configuration.lastSeenAt >= NOW() - INTERVAL 5 MINUTE AND configuration.status NOT IN ('PENDING', 'MAINTENANCE', 'DOWN', 'DOWNLOAD') THEN configuration.client_5 ELSE 0 END)";

const c6Count =
  "SUM(CASE WHEN configuration.lastSeenAt >= NOW() - INTERVAL 5 MINUTE AND configuration.status NOT IN ('PENDING', 'MAINTENANCE', 'DOWN', 'DOWNLOAD') THEN configuration.client_6 ELSE 0 END)";

export { configCount, downCount, maCount, c24Count, c5Count, c6Count };

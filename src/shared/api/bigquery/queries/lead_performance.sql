-- Sentinel Intelligence Query: Market Benchmark
-- Validates that the Intelligence Guard can reach BigQuery
-- and analyze query costs effectively.
SELECT 
  name,
  count(*) as occurrences
FROM `bigquery-public-data.usa_names.usa_1910_current`
WHERE year > 2020
GROUP BY 1
ORDER BY 2 DESC
LIMIT 10

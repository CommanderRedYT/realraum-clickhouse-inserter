CREATE DATABASE realraum;

DROP TABLE realraum.stats;

CREATE TABLE IF NOT EXISTS realraum.stats
(
    timestamp DateTime64(6) MATERIALIZED now() CODEC(DoubleDelta, LZ4),
    json String CODEC(ZSTD(1)),

    api String MATERIALIZED JSONExtractString(json, 'api'),

    state_open boolean MATERIALIZED JSONExtractBool(JSONExtractRaw(json, 'state'), 'open'),
    state_lastchange DateTime64(6) MATERIALIZED toDateTime(JSONExtractInt(JSONExtractRaw(json, 'state'), 'lastchange'), 'Europe/Vienna'),

    door_locked Array(String) MATERIALIZED JSONExtractArrayRaw(JSONExtractRaw(json, 'sensors'), 'door_locked'),
    door_contact Array(String) MATERIALIZED JSONExtractArrayRaw(JSONExtractRaw(json, 'sensors'), 'ext_door_ajar'),
    temperature Array(String) MATERIALIZED JSONExtractArrayRaw(JSONExtractRaw(json, 'sensors'), 'temperature'),
    humidity Array(String) MATERIALIZED JSONExtractArrayRaw(JSONExtractRaw(json, 'sensors'), 'humidity'),
    illumination Array(String) MATERIALIZED JSONExtractArrayRaw(JSONExtractRaw(json, 'sensors'), 'ext_illumination'),
    voltage Array(String) MATERIALIZED JSONExtractArrayRaw(JSONExtractRaw(json, 'sensors'), 'ext_voltage'),
    barometer Array(String) MATERIALIZED JSONExtractArrayRaw(JSONExtractRaw(json, 'sensors'), 'barometer'),

    total_member_count UInt64 MATERIALIZED JSONExtractUInt(JSONExtractArrayRaw(JSONExtractRaw(json, 'sensors'), 'total_member_count')[1], 'value')
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(timestamp)
ORDER BY (timestamp)
SETTINGS index_granularity = 8192;

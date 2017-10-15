create table api_call_log (
  id serial primary key,
  v4_address inet,
  v6_address inet,
  module text not null,
  action text not null,
  args jsonb,
  occurred timestamp default now(),
  unique (v4_address, module, action, occurred),
  unique (v6_address, module, action, occurred)
);

create index idx_api_call_log_v4_address on api_call_log using gist (v4_address inet_ops);
create index idx_api_call_log_v6_address on api_call_log using gist (v6_address inet_ops);
create index idx_api_call_log_module on api_call_log using gin(to_tsvector('english', module));
create index idx_api_call_log_action on api_call_log using gin(to_tsvector('english', action));
create index idx_api_call_log_args on api_call_log using gin (args);
create index idx_api_call_log_occurred on api_call_log (occurred);
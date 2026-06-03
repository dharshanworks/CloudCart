import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

const traceExporter = new OTLPTraceExporter({
  url: 'http://otel-collector-opentelemetry-collector.tracing.svc.cluster.local:4318/v1/traces'
});

const sdk = new NodeSDK({
  traceExporter,
  instrumentations: [getNodeAutoInstrumentations()],
  serviceName: 'cloudcart-backend'
});

sdk.start();

console.log('✅ OpenTelemetry initialized');
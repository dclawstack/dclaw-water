# Troubleshooting

Common issues and solutions for DClaw Water.

## Quick Diagnostics

```bash
# Check app pods
kubectl get pods -n dclaw-water

# Check logs
kubectl logs -n dclaw-water deployment/dclaw-water-backend

# Check database
kubectl get clusters -n dclaw-water
```

## Sections

- [Common Issues](./common-issues)
- [FAQ](./faq)

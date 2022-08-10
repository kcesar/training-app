### Start
- `cd server && yarn watch`
- `cd frontend && yarn start`
- `npx local-ssl-proxy --target 3000`

### Debugging multiple hostnames

- Add `DANGEROUSLY_DISABLE_HOST_CHECK=true` to frontend/.env.local
- Add hostnames to the local /etc/hosts file, pointing to 127.0.0.1
- Run `npx local-ssl-proxy --target 3000` so that all requests to https://my-host.name:9001 forwards to the dev server
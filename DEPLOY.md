# Deploying the Sitware store

**Where things run**

| Piece | Host | Address |
|---|---|---|
| Storefront (Next.js, `apps/storefront`) | Vercel | `store.<your-domain>` while testing, your main domain after go-live |
| Medusa backend + admin, Postgres, Redis (`apps/backend`, `deploy/`) | A new Oracle Cloud VM (Docker) | `api.<your-domain>` (admin at `/app`) |
| Product images | Oracle Object Storage, public bucket | `sitware-media` |
| Database backups | Oracle Object Storage, **private** bucket | `sitware-backups` |

Replace `<your-domain>` with Sitware's domain throughout.

> **Nothing that already exists is touched.** Everything below creates *new* resources in a
> *separate* compartment and network, and only *adds* DNS records. Never edit, resize or delete any
> other instance in the Oracle account (for example the Vistaaram or WordPress servers), their
> networks or security lists, and never change existing DNS records, until you decide to go live.

Commands in code blocks run on the new VM over SSH unless they say otherwise.

---

## Part 1 — Check free capacity (5 min)

Oracle's Always Free tier includes a fixed amount of Ampere (ARM) capacity shared by all VMs in
the account: historically **4 OCPUs and 24 GB RAM in total**.

1. Oracle console → ☰ → **Compute → Instances**. Check every compartment and add up the
   **OCPU / memory** of the `VM.Standard.A1.Flex` instances that already run.
2. The Sitware VM needs **2 OCPUs / 12 GB** (minimum **1 OCPU / 6 GB** with the swap from Part 7).
3. If there is not enough free ARM capacity, stop here. Options: a separate Oracle account,
   a paid shape, or the smaller size. Do **not** resize or stop another VM to make room.

## Part 2 — Separate compartment (2 min)

☰ → **Identity & Security → Compartments → Create Compartment**
- Name: `sitware-store`, description: "Sitware Medusa backend". Parent: root.

Create everything below inside `sitware-store`.

## Part 3 — Network (5 min)

☰ → **Networking → Virtual Cloud Networks** → compartment `sitware-store` → **Start VCN Wizard**
→ **Create VCN with Internet Connectivity**.
- Name: `sitware-store-vcn`. Keep the default CIDR blocks. Create.

Open the web ports on this new VCN only:
1. Open `sitware-store-vcn` → **Security Lists** → **Default Security List for sitware-store-vcn**.
2. **Add Ingress Rules** twice:
   - Source CIDR `0.0.0.0/0`, IP Protocol TCP, Destination port `80`
   - Source CIDR `0.0.0.0/0`, IP Protocol TCP, Destination port `443`
   (Port 22 for SSH is already open by default.)

## Part 4 — Create the VM (10 min)

☰ → **Compute → Instances → Create instance**, compartment `sitware-store`:
- Name: `sitware-api`
- Image: **Canonical Ubuntu 24.04**
- Shape: **Ampere → VM.Standard.A1.Flex**, **2 OCPUs, 12 GB** (or 1 / 6 GB, see Part 1)
- Networking: `sitware-store-vcn`, **public subnet**, *Assign a public IPv4 address* ✔
- SSH keys: **Generate a key pair for me** → **Save private key** (keep this file safe; it is the
  only way to log in)
- Boot volume: 50 GB. (The free tier's 200 GB total is shared with other VMs' disks.)
- Create. If you see **"Out of capacity"**, try again later or another availability domain.

When it is running, copy its **Public IP address**. Recommended: make it permanent with
☰ → Networking → **Reserved Public IPs** → Reserve, then attach it to the instance's VNIC.

## Part 5 — Object Storage buckets and keys (10 min)

1. ☰ → **Governance & Administration → Tenancy details** → copy the **Object storage namespace**.
   Note your region identifier, e.g. `ap-mumbai-1` or `ap-hyderabad-1`.
2. ☰ → **Storage → Buckets** → compartment `sitware-store`:
   - **Create Bucket** `sitware-media`, then **Edit Visibility → Public** (listing off). Product
     images must be public.
   - **Create Bucket** `sitware-backups`. Leave it **Private**.
3. Profile icon → **My profile → Customer secret keys → Generate secret key**, name
   `sitware-store`. Copy the **secret** immediately (it is shown once) and the **Access key**.

## Part 6 — DNS (5 min, wherever Sitware's domain DNS is managed)

**Add** one record. Do not change any existing record:

| Type | Name | Value |
|---|---|---|
| A | `api` | the VM's public IP |

The storefront record (`store`) is added in Part 9, when Vercel shows its value.

## Part 7 — Set up the VM (20 min)

From your PC, log in with the private key you saved:

```bash
ssh -i path/to/ssh-key.key ubuntu@<VM-PUBLIC-IP>
```

On the VM:

```bash
# Updates, Docker, firewall ports (Oracle's Ubuntu images block 80/443 in iptables by default)
sudo apt-get update && sudo apt-get -y upgrade
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker ubuntu
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo netfilter-persistent save

# 4 GB swap: the first build compiles the admin dashboard and needs the headroom
sudo fallocate -l 4G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

exit
```

Log in again (so the `docker` group applies), then get the code and configure it. The repository
is private, so GitHub asks for your username and a personal access token with read access:

```bash
git clone https://github.com/konnectwithkunal/sitware.git
cd sitware/deploy
cp env.example .env
openssl rand -hex 32   # run 3 times: POSTGRES_PASSWORD, JWT_SECRET, COOKIE_SECRET
nano .env              # fill in every value (notes below); Ctrl+O to save, Ctrl+X to exit
chmod 600 .env
```

`.env` notes:
- `API_DOMAIN` = `api.<your-domain>`; `STOREFRONT_URL` = `https://store.<your-domain>`
- `STORE_CORS` and `AUTH_CORS` = `https://store.<your-domain>`; `ADMIN_CORS` = `https://api.<your-domain>`
- `S3_ENDPOINT` = `https://<namespace>.compat.objectstorage.<region>.oraclecloud.com`
- `S3_FILE_URL` = `https://objectstorage.<region>.oraclecloud.com/n/<namespace>/b/sitware-media/o`
- `S3_BUCKET` = `sitware-media`, `BACKUP_BUCKET` = `sitware-backups`, `S3_REGION` = your region
- `SHIPPING_FLAT_FEE` / `FREE_SHIPPING_THRESHOLD`: the confirmed delivery charges
- Razorpay, Google, Resend and `CONTACT_EMAIL` can be filled in now or later (Part 11).

Start everything (the first build takes 5–15 minutes):

```bash
docker compose up -d --build
docker compose logs -f medusa      # wait for "Server is ready on port: 9000", then Ctrl+C
curl https://api.<your-domain>/health   # prints OK
```

If `curl` fails, check `docker compose logs caddy`: usually DNS has not reached the server yet
(wait 10–30 minutes) or ports 80/443 are not open (Parts 3 and 7).

## Part 8 — Configure the store (10 min)

```bash
cd ~/sitware/deploy
run() { docker compose exec "$@"; }

# India region, INR, tax region, stock location, delivery and return options, COD (+ Razorpay)
run medusa npx medusa exec ./src/scripts/setup-checkout.js

# A fresh database has no demo data; this dry run should list nothing to remove
run medusa npx medusa exec ./src/scripts/remove-demo-data.js

# Your admin login for https://api.<your-domain>/app (use a strong password)
run medusa npx medusa user -e you@<your-domain> -p '<strong-password>'

# Values the storefront needs; keep this output for Part 9
run medusa npx medusa exec ./src/scripts/print-storefront-env.js
```

Then in the admin (`https://api.<your-domain>/app`) add Sitware Switch and Switch Pro with the
handles **`switch`** and **`switch-pro`**, their real prices in INR, stock at "Sitware Warehouse",
the default shipping profile, the sales channel, and product photos. Uploads go straight to the
`sitware-media` bucket. Do not run `create-test-product` here; it refuses to run in production.

Turn on nightly backups:

```bash
chmod +x backup.sh && mkdir -p backups && ./backup.sh     # test once
(crontab -l 2>/dev/null; echo "30 2 * * * cd $(pwd) && ./backup.sh >> backups/backup.log 2>&1") | crontab -
```

Check that the dump appears under `db/` in the `sitware-backups` bucket.

## Part 9 — Storefront on Vercel (15 min)

1. vercel.com → **Add New → Project** → import `konnectwithkunal/sitware`.
   - **Root Directory:** `apps/storefront` (leave "Include files outside the root directory" on;
     Vercel installs the pnpm workspace from the repository root).
   - Framework: Next.js. **Node.js version:** 22.x (Project → Settings → General).
2. **Environment Variables** (Production and Preview):

   | Name | Value |
   |---|---|
   | the 4 lines printed by `print-storefront-env` | as printed (`NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`, `NEXT_PUBLIC_DEFAULT_REGION`, `NEXT_PUBLIC_MEDUSA_BACKEND_URL`, `NEXT_PUBLIC_BASE_URL`) |
   | `NEXT_PUBLIC_STAGING` | `true` (keeps the store out of search engines until go-live) |
   | `NEXT_PUBLIC_GOOGLE_LOGIN_ENABLED` | `true` only once Google keys are set on the backend |
   | `NEXT_PUBLIC_RETURN_WINDOW_DAYS` | the confirmed return window in days, or leave unset |

3. Deploy. Then **Settings → Domains → Add** `store.<your-domain>`; Vercel shows a DNS record
   (usually a `CNAME` for `store`). **Add** exactly that record at your DNS provider.

## Part 10 — Product images and checks (10 min)

Images uploaded in the production admin are already in Object Storage. Only if products were
created elsewhere with `localhost` image URLs, move them (run where those URLs are reachable, or
point `IMAGE_SOURCE_URL` at a site that serves the same paths):

```bash
docker compose exec -e IMAGE_SOURCE_URL=https://<host-serving-the-images> medusa \
  npx medusa exec ./src/scripts/migrate-product-images.js
```

Then test on your phone at `https://store.<your-domain>`:
- [ ] Add a workstation to the bag, check out with **Cash on Delivery**, see the confirmation page
- [ ] The order appears at `https://api.<your-domain>/app` → Orders
- [ ] Track it at `/track` with the order number and email
- [ ] Sign up, add an address, save a product to the wishlist
- [ ] Contact form and "Forgot password" emails arrive (needs Resend, Part 11)

## Part 11 — Optional integrations

Edit `~/sitware/deploy/.env`, then apply with `docker compose up -d` (and re-run
`setup-checkout.js` after adding Razorpay so it is enabled on the region).

- **Resend** (password reset, order linking, contact form): verify the sending domain in Resend,
  then set `RESEND_API_KEY`, `EMAIL_FROM` and `CONTACT_EMAIL`.
- **Razorpay:** set `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` (test keys first), register the webhook
  `https://api.<your-domain>/hooks/payment/razorpay_razorpay` for `payment.authorized`,
  `payment.captured`, `payment.failed` and `order.paid`, and set `RAZORPAY_WEBHOOK_SECRET`.
- **Google login:** create an OAuth client, add the redirect URI
  `https://store.<your-domain>/auth/google/callback`, set `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
  here and `NEXT_PUBLIC_GOOGLE_LOGIN_ENABLED=true` on Vercel (then redeploy).

## Before go-live (owner checklist)

- [ ] Business details in `apps/storefront/src/lib/site.ts` (legal name, address, GSTIN, customer
      care, grievance officer) and policy text in `apps/storefront/src/lib/policies.ts`
- [ ] Shipping fee and free-shipping threshold confirmed in `.env` and `setup-checkout.js` re-run
- [ ] Switch and Switch Pro prices, stock, specifications and photos in the admin
- [ ] GST rate on the India tax region in the admin, if prices should show tax separately
- [ ] Warehouse address on the "Sitware Warehouse" stock location in the admin

## Go-live (when you are ready to use the main domain)

1. Vercel → Domains → add the main domain (and `www`); update **those** DNS records to what
   Vercel shows. Whatever served the main domain before stops being served at this moment.
2. Vercel env: `NEXT_PUBLIC_BASE_URL=https://<your-domain>`, delete `NEXT_PUBLIC_STAGING`, redeploy.
3. VM `.env`: `STOREFRONT_URL=https://<your-domain>`, add `https://<your-domain>` to `STORE_CORS`
   and `AUTH_CORS`, then `docker compose up -d`.
4. Google Cloud: add `https://<your-domain>/auth/google/callback`.

## Everyday operations

```bash
cd ~/sitware/deploy
docker compose ps                          # what is running
docker compose logs --tail 100 medusa      # recent backend logs
git -C ~/sitware pull && docker compose up -d --build medusa   # deploy new backend code
```

- New storefront code deploys automatically on Vercel when `main` is pushed.
- **Restore a backup:** see the comments at the top of `deploy/backup.sh`.
- **Security:** keep the SSH private key and `.env` private; never commit `.env`. Run
  `sudo apt-get update && sudo apt-get -y upgrade` monthly.

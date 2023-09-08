# SvelteKit short URLs

A simple SvelteKit endpoint to redirect URL pathname to specified
destination.

Uses Upstash Redis for storing links and details

## Usage

**Adding a Hash**: In the Web CLI, you'd type the following and press
Enter:

```bash
hmset short_url:<key> destination "<destination>" description "<description>"
```

**Updating a Field in Hash**: To update a specific field, type:

```bash
hset short_url:<key> <field> "<new_value>"
```

**Deleting a Hash**: To delete a hash, enter:

```bash
del short_url:<key>
```

**Viewing All Keys**: To see all keys, you'd type:

```bash
keys *
```

**Viewing a Hash**: To get all fields and values of a specific hash,
type:

```bash
hgetall short_url:<key>
```

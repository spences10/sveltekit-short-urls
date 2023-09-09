# SvelteKit short URLs

A simple SvelteKit endpoint to redirect URL pathname to specified
destination.

Uses Upstash Redis for storing links and details

## Usage

**Adding a Hash**: In the Web CLI, you'd type the following and press
Enter:

```bash
HSET short_url:<key> destination "<destination>" description "<description>" visible "true | false"
```

**Updating a Field in Hash**: To update a specific field,
type:

```bash
HSET short_url:<key> <field1> "<new_value1>" <field2> "<new_value2>"
```

**Deleting a Hash**: To delete a hash, enter:

```bash
DEL short_url:<key>
```

**Viewing All Keys**: To see all keys, you'd type:

```bash
KEYS *
```

**Viewing a Hash**: To get all fields and values of a specific hash,
type:

```bash
HGETALL short_url:<key>
```

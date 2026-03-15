## Solution - 3 bugs found.

## Debugging

Logged in at `https://betastudent.beetroot.academy`. Login is successful. My name appears. Dashboard displays "You don't have any courses yet." I opened the Network tab. Filtered Fetch/XHR. Two POST request to :4000/.

I have noticed first one: Query - getMyCourses

```json
{ "operationName": "getMyCourses", "variables": {}, "query": "..." }
```

Response:  `{"data":{"getMyCoursesV2":[]}}` - empty. No errors. Variables: `{}` - no user id is sent. But Authorization header with JWT is present. Decoded the token (`atob` on payload). User is `cmm8v76n96hpp0834hnz92nsd` is present. Went to the code.

## Bug 1 - resolver users args insted of JWN

`getMyCoursesV2.js`:
```js
const userId = args.userId || '';
```

The frontend doesn't send `userId` in variables (checked in network tab — `variables: {}`). So this is always `''`. Query hits the DB with empty `id`, gets nothing back.
We should use `getUser(ctx)` to get `id` from JWT.

Fix:
```diff
- const userId = args.userId || '';
+ const user = await getUser(ctx);
+ if (!user) throw new Error('Not authorized');
+ const userId = user.id;
```

## Bug 2 — error link eats real errors

In the file `apollo-error-link.js`:
```js
if (/not/i.test(message)) {
  return;
}
```

This regex matches "does not exist". All are filtered out before the Snackbar has a chance to display them. Hence, users see zero errors.

```diff
- if (/not/i.test(message)) {
+ if (/already\s+exists/i.test(message)) {
```

## Bug 3: logger is dead

`logger.js`
```javascript
console.log('LOGGGER ===> ');
return;
```

The early return statement kills the whole function. `insertErrorLog` calls `insertLog` which simply returns. Nothing is saved.

Fix: Remove the return statement:
```diff
  console.log('LOGGGER ===> ');
- return;
```

## Production Improvements

* Extract the user in the middleware so the resolvers don’t have to call `getUser` individually
* Verify `getMyCoursesV2` actually returns data for a user with enrollments
* Use specific error suppression patterns instead of broad regex
<!DOCTYPE html>
<html>
<head>
    <title>Login Test</title>
</head>
<body>
    <form action="/api/login" method="POST">
        @csrf
        <label>Email:</label>
        <input type="email" name="email" value="admin@example.com" />
        <br>
        <label>Password:</label>
        <input type="password" name="password" value="password123" />
        <br>
        <button type="submit">Login</button>
    </form>
</body>
</html>

<?php

require_once __DIR__ . '/../vendor/autoload.php';

use Twig\Environment;
use Twig\Loader\FilesystemLoader;

require_once __DIR__ . '/helpers/twig.php';


// Start session for simple auth guard
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Twig setup
// Load Twig templates from the 'templates' folder
$loader = new FilesystemLoader(__DIR__ . '/../templates');
$twig = new Environment($loader);
// Register custom Twig helpers after environment is created
$twig = registerTwigHelpers($twig);

// Simple auth check
function requireAuth(): void {
    if (empty($_SESSION['user'])) {
        header('Location: /auth/login');
        exit;
    }
}

// Router setup
$router = new AltoRouter();
// If your app is in a subfolder, set basePath here, e.g.: $router->setBasePath('/twigticket');

// Routes mapping (Vue parity)
$router->map('GET', '/', function () use ($twig) {
    echo $twig->render('home.html.twig', [
        'title' => 'Home'
    ]);
});

$router->map('GET', '/auth/login', function () use ($twig) {
    echo $twig->render('login.html.twig', [
        'title' => 'Login'
    ]);
});

// Handle login submission (mock auth)
$router->map('POST', '/auth/login', function () use ($twig) {
    $email = $_POST['email'] ?? null;
    $password = $_POST['password'] ?? null;
    $name = $_POST['name'] ?? null;
    // In real app, validate credentials. Here we accept any non-empty pair.
    if ($email && $password) {
        if (!$name) {
            // Derive a simple display name from the email if not provided
            $name = strtok($email, '@') ?: 'User';
        }
        $_SESSION['user'] = [
            'email' => $email,
            'name' => $name,
        ];
        header('Location: /user/dashboard');
        exit;
    }
    echo $twig->render('login.html.twig', [
        'title' => 'Login',
        'error' => 'Invalid credentials.'
    ]);
});

$router->map('GET', '/auth/signup', function () use ($twig) {
    echo $twig->render('signup.html.twig', [
        'title' => 'Signup'
    ]);
});

$router->map('GET', '/user/dashboard', function () use ($twig) {
    requireAuth();
    echo $twig->render('dashboard.html.twig', [
        'title' => 'Dashboard',
        'user' => $_SESSION['user'] ?? null,
    ]);
});

$router->map('GET', '/user/tickets', function () use ($twig) {
    requireAuth();
    echo $twig->render('tickets.html.twig', [
        'title' => 'Tickets',
        'user' => $_SESSION['user'] ?? null,
    ]);
});

// Logout
$router->map('GET', '/auth/logout', function () {
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $params['path'], $params['domain'],
            $params['secure'], $params['httponly']
        );
    }
    session_destroy();
    header('Location: /auth/login');
    exit;
});

// Match current request
$match = $router->match();

if ($match && is_callable($match['target'])) {
    call_user_func_array($match['target'], $match['params']);
} else {
    // 404 parity: redirect to /auth/login
    header('Location: /auth/login');
    exit;
}

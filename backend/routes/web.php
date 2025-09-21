<?php

use Illuminate\Support\Facades\Route;
Route::get('/login-test', function() {
    return view('login');
});

Route::get('/', function () {
    return view('welcome');
});

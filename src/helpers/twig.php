<?php
use Twig\TwigFunction;

/**
 * Register custom Twig helper functions
 */
function registerTwigHelpers($twig)
{
    // Status badge classes
    $twig->addFunction(new TwigFunction('getStatusClass', function ($status) {
        $classes = [
            'open' => 'bg-green-100 text-green-800',
            'in_progress' => 'bg-amber-100 text-amber-800',
            'closed' => 'bg-gray-100 text-gray-800',
        ];
        return $classes[$status] ?? 'bg-gray-100 text-gray-800';
    }));

    // Priority badge classes
    $twig->addFunction(new TwigFunction('getPriorityClass', function ($priority) {
        $classes = [
            'low' => 'text-green-600 bg-green-50',
            'medium' => 'text-blue-600 bg-blue-50',
            'high' => 'text-red-600 bg-red-50',
        ];
        return $classes[$priority] ?? 'bg-gray-100 text-gray-800';
    }));

    return $twig;
}

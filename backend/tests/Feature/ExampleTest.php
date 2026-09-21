<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_the_application_returns_a_successful_response(): void
    {
        $response = $this->get('/');

        $response->assertOk()
            ->assertJson([
                'success' => true,
                'servicio' => 'NexoCommerce REST API',
            ]);
    }
}

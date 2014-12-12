<?php
return array(
    'controllers' => array(
        'factories' => array(
            'KapEmail\\V1\\Rpc\\Email\\Controller' => 'KapEmail\\V1\\Rpc\\Email\\EmailControllerFactory',
        ),
    ),
    'router' => array(
        'routes' => array(
            'kap-email.rpc.email' => array(
                'type' => 'Segment',
                'options' => array(
                    'route' => '/email',
                    'defaults' => array(
                        'controller' => 'KapEmail\\V1\\Rpc\\Email\\Controller',
                        'action' => 'email',
                    ),
                ),
            ),
        ),
    ),
    'zf-versioning' => array(
        'uri' => array(
            0 => 'kap-email.rpc.email',
        ),
    ),
    'zf-rpc' => array(
        'KapEmail\\V1\\Rpc\\Email\\Controller' => array(
            'service_name' => 'email',
            'http_methods' => array(
                0 => 'POST',
                1 => 'GET',
            ),
            'route_name' => 'kap-email.rpc.email',
        ),
    ),
    'zf-content-negotiation' => array(
        'controllers' => array(
            'KapEmail\\V1\\Rpc\\Email\\Controller' => 'Json',
        ),
        'accept_whitelist' => array(
            'KapEmail\\V1\\Rpc\\Email\\Controller' => array(
                0 => 'application/vnd.kap-email.v1+json',
                1 => 'application/json',
                2 => 'application/*+json',
            ),
        ),
        'content_type_whitelist' => array(
            'KapEmail\\V1\\Rpc\\Email\\Controller' => array(
                0 => 'application/vnd.kap-email.v1+json',
                1 => 'application/json',
            ),
        ),
    ),
    'zf-content-validation' => array(
        'KapEmail\\V1\\Rpc\\Email\\Controller' => array(
            'input_filter' => 'KapEmail\\V1\\Rpc\\Email\\Validator',
        ),
    ),
    'input_filter_specs' => array(
        'KapEmail\\V1\\Rpc\\Email\\Validator' => array(
            0 => array(
                'name' => 'name',
                'required' => true,
                'filters' => array(),
                'validators' => array(),
                'allow_empty' => false,
                'continue_if_empty' => false,
            ),
            1 => array(
                'name' => 'email',
                'required' => true,
                'filters' => array(),
                'validators' => array(
                    0 => array(
                        'name' => 'Zend\\Validator\\EmailAddress',
                        'options' => array(),
                    ),
                ),
                'allow_empty' => false,
                'continue_if_empty' => false,
            ),
        ),
    ),
);

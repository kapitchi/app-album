<?php
return array(
    'router' => array(
        'routes' => array(
            'kap-page.rest.page' => array(
                'type' => 'Segment',
                'options' => array(
                    'route' => '/page[/:page_id]',
                    'defaults' => array(
                        'controller' => 'KapPage\\V1\\Rest\\Page\\Controller',
                    ),
                ),
            ),
        ),
    ),
    'zf-versioning' => array(
        'uri' => array(
            0 => 'kap-page.rest.page',
        ),
    ),
    'zf-rest' => array(
        'KapPage\\V1\\Rest\\Page\\Controller' => array(
            'listener' => 'KapPage\\V1\\Rest\\Page\\PageResource',
            'route_name' => 'kap-page.rest.page',
            'route_identifier_name' => 'page_id',
            'collection_name' => 'page',
            'entity_http_methods' => array(
                0 => 'GET',
                1 => 'PATCH',
                2 => 'PUT',
                3 => 'DELETE',
            ),
            'collection_http_methods' => array(
                0 => 'GET',
                1 => 'POST',
            ),
            'collection_query_whitelist' => array('query', 'page_size', 'order_by'),
            'page_size' => 25,
            'page_size_param' => null,
            'entity_class' => 'KapPage\\V1\\Rest\\Page\\PageEntity',
            'collection_class' => 'KapPage\\V1\\Rest\\Page\\PageCollection',
            'service_name' => 'page',
        ),
    ),
    'zf-content-negotiation' => array(
        'controllers' => array(
            'KapPage\\V1\\Rest\\Page\\Controller' => 'HalJson',
        ),
        'accept_whitelist' => array(
            'KapPage\\V1\\Rest\\Page\\Controller' => array(
                0 => 'application/vnd.kap-page.v1+json',
                1 => 'application/hal+json',
                2 => 'application/json',
            ),
        ),
        'content_type_whitelist' => array(
            'KapPage\\V1\\Rest\\Page\\Controller' => array(
                0 => 'application/vnd.kap-page.v1+json',
                1 => 'application/json',
            ),
        ),
    ),
    'zf-hal' => array(
        'metadata_map' => array(
            'KapPage\\V1\\Rest\\Page\\PageEntity' => array(
                'entity_identifier_name' => 'id',
                'route_name' => 'kap-page.rest.page',
                'route_identifier_name' => 'page_id',
                'hydrator' => 'Zend\\Stdlib\\Hydrator\\ArraySerializable',
            ),
            'KapPage\\V1\\Rest\\Page\\PageCollection' => array(
                'entity_identifier_name' => 'id',
                'route_name' => 'kap-page.rest.page',
                'route_identifier_name' => 'page_id',
                'is_collection' => true,
            ),
        ),
    ),
    'zf-apigility' => array(
        'db-connected' => array(
            'KapPage\\V1\\Rest\\Page\\PageResource' => array(
                'adapter_name' => 'DefaultDbAdapter',
                'table_name' => 'page',
                'hydrator_name' => 'Zend\\Stdlib\\Hydrator\\ArraySerializable',
                'controller_service_name' => 'KapPage\\V1\\Rest\\Page\\Controller',
                'entity_identifier_name' => 'id',
            ),
        ),
    ),
);

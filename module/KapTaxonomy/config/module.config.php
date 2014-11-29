<?php
return array(
    'router' => array(
        'routes' => array(
            'kap-taxonomy.rest.tag' => array(
                'type' => 'Segment',
                'options' => array(
                    'route' => '/tag[/:tag_id]',
                    'defaults' => array(
                        'controller' => 'KapTaxonomy\\V1\\Rest\\Tag\\Controller',
                    ),
                ),
            ),
        ),
    ),
    'zf-versioning' => array(
        'uri' => array(
            0 => 'kap-taxonomy.rest.tag',
        ),
    ),
    'zf-rest' => array(
        'KapTaxonomy\\V1\\Rest\\Tag\\Controller' => array(
            'listener' => 'KapTaxonomy\\V1\\Rest\\Tag\\TagResource',
            'route_name' => 'kap-taxonomy.rest.tag',
            'route_identifier_name' => 'tag_id',
            'collection_name' => 'tag',
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
            'collection_query_whitelist' => array(
                0 => 'query',
                1 => 'order_by',
            ),
            'page_size' => 25,
            'page_size_param' => 'page_size',
            'entity_class' => 'KapTaxonomy\\V1\\Rest\\Tag\\TagEntity',
            'collection_class' => 'KapTaxonomy\\V1\\Rest\\Tag\\TagCollection',
            'service_name' => 'tag',
        ),
    ),
    'zf-content-negotiation' => array(
        'controllers' => array(
            'KapTaxonomy\\V1\\Rest\\Tag\\Controller' => 'HalJson',
        ),
        'accept_whitelist' => array(
            'KapTaxonomy\\V1\\Rest\\Tag\\Controller' => array(
                0 => 'application/vnd.kap-taxonomy.v1+json',
                1 => 'application/hal+json',
                2 => 'application/json',
            ),
        ),
        'content_type_whitelist' => array(
            'KapTaxonomy\\V1\\Rest\\Tag\\Controller' => array(
                0 => 'application/vnd.kap-taxonomy.v1+json',
                1 => 'application/json',
            ),
        ),
    ),
    'zf-hal' => array(
        'metadata_map' => array(
            'KapTaxonomy\\V1\\Rest\\Tag\\TagEntity' => array(
                'entity_identifier_name' => 'id',
                'route_name' => 'kap-taxonomy.rest.tag',
                'route_identifier_name' => 'tag_id',
                'hydrator' => 'Zend\\Stdlib\\Hydrator\\ArraySerializable',
            ),
            'KapTaxonomy\\V1\\Rest\\Tag\\TagCollection' => array(
                'entity_identifier_name' => 'id',
                'route_name' => 'kap-taxonomy.rest.tag',
                'route_identifier_name' => 'tag_id',
                'is_collection' => true,
            ),
        ),
    ),
    'zf-apigility' => array(
        'db-connected' => array(
            'KapTaxonomy\\V1\\Rest\\Tag\\TagResource' => array(
                'adapter_name' => 'DefaultDbAdapter',
                'table_name' => 'tag',
                'hydrator_name' => 'Zend\\Stdlib\\Hydrator\\ArraySerializable',
                'controller_service_name' => 'KapTaxonomy\\V1\\Rest\\Tag\\Controller',
                'entity_identifier_name' => 'id',
            ),
        ),
    ),
    'zf-mvc-auth' => array(
        'authorization' => array(
            'KapTaxonomy\\V1\\Rest\\Tag\\Controller' => array(
                'entity' => array(
                    'GET' => false,
                    'POST' => false,
                    'PATCH' => true,
                    'PUT' => true,
                    'DELETE' => true,
                ),
                'collection' => array(
                    'GET' => false,
                    'POST' => true,
                    'PATCH' => false,
                    'PUT' => false,
                    'DELETE' => false,
                ),
            ),
        ),
    ),
);

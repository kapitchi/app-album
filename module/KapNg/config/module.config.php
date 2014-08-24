<?php
return array(
    'router' => array(
        'routes' => array(
            'kap-ng/template' => array(
                'type' => 'Zend\Mvc\Router\Http\Segment',
                'options' => array(
                    'route'    => '/template/[:template].html',
                    'defaults' => array(
                        'controller' => 'KapNg\Controller\TemplateController',
                        'action' => 'template'
                    ),
                ),
            ),
        ),
    ),
    'view_manager' => array(
        'template_map' => array(
            'kap-ng/loader'   => __DIR__ . '/../view/kap-ng/loader.phtml',
        )
    )
);

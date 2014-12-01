<?php
/**
 * Kapitchi Zend Framework 2 Modules
 *
 * @copyright Copyright (c) 2012-2014 Kapitchi Open Source Community (http://kapitchi.com/open-source)
 * @license   http://opensource.org/licenses/MIT MIT
 */

return [
    'file-manager' => array(
        'filesystem-manager' => [
            'config' => [
                'album_item' => [
                    'type' => 'local',
                    'options' => [
                        'path' => __DIR__ . '/../../data/album-item'
                    ]
                ],
                'album_item_thumbnail' => [
                    'type' => 'local',
                    'options' => [
                        'path' => __DIR__ . '/../../data/album-item-thumbnail'
                    ]
                ],
                'file_thumbnail' => [
                    'type' => 'local',
                    'options' => [
                        'path' => __DIR__ . '/../../public/file_thumbnail'
                    ]
                ]
            ]
        ],
        'thumbnail-types' => [
            'fullsize' => [
                'filter' => 'fit',
                'width' => 1920,
                'height' => 1080
            ],
            'album' => [
                'filter' => 'fit',
                'width' => 350,
                'height' => 350
            ],
            'gallery_item' => [
                'filter' => 'fit',
                'width' => 350,
                'height' => 350
            ],
            'image_browser' => [
                'filter' => 'fit',
                'width' => 150,
                'height' => 150
            ]
        ]
    ),
];
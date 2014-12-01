<?php
/**
 * Kapitchi Zend Framework 2 Modules
 *
 * @copyright Copyright (c) 2012-2014 Kapitchi Open Source Community (http://kapitchi.com/open-source)
 * @license   http://opensource.org/licenses/MIT MIT
 */

return [
    'requirejs' => [
        'config' => [
            'module/main-app' => [
                'homeAlbumId' => 1,
                'mainNavigation' => [
                    [
                        'label' => 'O mně',
                        'state' => [
                            'name' => 'app.page',
                            'params' => [
                                'key' => 'about-me'
                            ]
                        ]
                    ],
                    [
                        'label' => 'Aktuality',
                        'state' => [
                            'name' => 'app.page',
                            'params' => [
                                'key' => 'news'
                            ]
                        ]
                    ],
                    [
                        'label' => 'Galerie',
                        'state' => [
                            'name' => 'app.album',
                            'params' => [
                                'albumId' => 1
                            ]
                        ]
                    ],
                    [
                        'label' => 'Spolupráce',
                        'state' => [
                            'name' => 'app.album',
                            'params' => [
                                'albumId' => 2
                            ]
                        ]
                    ],
                    [
                        'label' => 'Reference',
                        'state' => [
                            'name' => 'app.page',
                            'params' => [
                                'key' => 'references'
                            ]
                        ]
                    ],
                    [
                        'label' => 'Přehled služeb',
                        'state' => [
                            'name' => 'app.page',
                            'params' => [
                                'key' => 'services'
                            ]
                        ]
                    ],
                    [
                        'label' => 'Kontakt',
                        'state' => [
                            'name' => 'app.contact',
                        ]
                    ]
                ]
            ],
        ]
    ]
];
    
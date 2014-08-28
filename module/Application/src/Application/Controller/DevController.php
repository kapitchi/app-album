<?php
/**
 * Zend Framework (http://framework.zend.com/)
 *
 * @link      http://github.com/zendframework/ZendSkeletonApplication for the canonical source repository
 * @copyright Copyright (c) 2005-2014 Zend Technologies USA Inc. (http://www.zend.com)
 * @license   http://framework.zend.com/license/new-bsd New BSD License
 */

namespace Application\Controller;

use Zend\Mvc\Controller\AbstractActionController;
use Zend\View\Model\ViewModel;
use Zend\View\View;
use ZF\MvcAuth\Identity\AuthenticatedIdentity;

class DevController extends AbstractActionController
{
    public function buildAction()
    {
        $fileRepository = $this->getServiceLocator()->get('KapFileManager\FileRepository');
        $manager = $this->getServiceLocator()->get('KapFileManager\FilesystemManager');

        $ret = [];
        $ret['album_item'] = $fileRepository->sync($manager, 'album_item', new AuthenticatedIdentity(1));
        $ret['album_item_thumbnail'] = $fileRepository->sync($manager, 'album_item_thumbnail', new AuthenticatedIdentity(1));
        $ret['file_thumbnail'] = $fileRepository->sync($manager, 'file_thumbnail', new AuthenticatedIdentity(1));

        return new \Zend\View\Model\JsonModel($ret);
    }

}

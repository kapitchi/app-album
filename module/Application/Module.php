<?php
/**
 * Zend Framework (http://framework.zend.com/)
 *
 * @link      http://github.com/zendframework/ZendSkeletonApplication for the canonical source repository
 * @copyright Copyright (c) 2005-2014 Zend Technologies USA Inc. (http://www.zend.com)
 * @license   http://framework.zend.com/license/new-bsd New BSD License
 */

namespace Application;

use Zend\Mvc\Application;
use Zend\Mvc\ModuleRouteListener;
use Zend\Mvc\MvcEvent;
use Zend\Mvc\Router\RouteMatch;

class Module
{
    public function onBootstrap(MvcEvent $e)
    {
        $eventManager        = $e->getApplication()->getEventManager();
        $moduleRouteListener = new ModuleRouteListener();
        $moduleRouteListener->attach($eventManager);

        //handle 404 by angularjs app (and its routing) if it's not angular app request i.e. with application/json accept header
        $eventManager->attach('dispatch.error', function($e) {
            
            if ($e->getError() !== Application::ERROR_ROUTER_NO_MATCH) {
                return;
            }

            //is this AngularJS request (e.g. template, or API call)? If so - return 404
            $x = $e->getRequest()->getHeaders('Accept')->getPrioritized();
            if($x[0] && $x[0]->getTypeString() == 'application/json') {
                return;
            }
            
            //... otherwise render angularjs app page
            $e->setError(false);
            $e->setRouteMatch(new RouteMatch(array(
                'controller' => 'Application\Controller\Index',
                'action'     => 'index',
            )));
            $e->stopPropagation(true);
            
        }, 1000);
    }

    public function getConfig()
    {
        return include __DIR__ . '/config/module.config.php';
    }

    public function getAutoloaderConfig()
    {
        return array(
            'Zend\Loader\StandardAutoloader' => array(
                'namespaces' => array(
                    __NAMESPACE__ => __DIR__ . '/src/' . __NAMESPACE__,
                ),
            ),
        );
    }
}

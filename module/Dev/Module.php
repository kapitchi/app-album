<?php
namespace Dev;

use KapApigility\DbEntityRepository;
use KapSecurity\Authentication\Adapter\OAuth2;
use KapSecurity\Authentication\Adapter\CallbackAdapterInterface;
use KapSecurity\Authentication\AuthenticationService;
use KapSecurity\Authentication\Options;
use KapSecurity\V1\Rest\AuthenticationService\AuthenticationServiceEntity;
use KapSecurity\V1\Rest\IdentityAuthentication\IdentityAuthenticationResource;
use Zend\Db\TableGateway\TableGateway;
use Zend\Mvc\MvcEvent;
use Zend\Paginator\Paginator;
use ZF\Apigility\Provider\ApigilityProviderInterface;
use ZF\MvcAuth\Identity\AuthenticatedIdentity;
use ZF\MvcAuth\Identity\GuestIdentity;
use ZF\MvcAuth\MvcAuthEvent;

class Module
{
    protected $sm;

    public function onBootstrap($e)
    {
        $app = $e->getTarget();
        $this->sm = $app->getServiceManager();

        $events   = $app->getEventManager();
        $events->attach(MvcEvent::EVENT_RENDER, array($this, 'onRender'), 110);
        $events->attach(MvcAuthEvent::EVENT_AUTHENTICATION_POST, array($this, 'onAuthenticationPost'), -100);
    }

    public function onRender($e)
    {
        $helpers = $this->sm->get('ViewHelperManager');
        $hal = $helpers->get('hal');

        //$hal->getEventManager()->attach(['renderEntity'], array($this, 'onRenderEntity'));
    }

    public function onAuthenticationPost(MvcAuthEvent $e)
    {
//        $identity = new AuthenticatedIdentity(1);
//        $identity->setName('user');
//
//        $e->setIdentity($identity);
    }

    public function getConfig()
    {
        return [];
    }

    public function getAutoloaderConfig()
    {
        return array(
            'ZF\Apigility\Autoloader' => array(
                'namespaces' => array(
                    __NAMESPACE__ => __DIR__,
                ),
            ),
        );
    }
}

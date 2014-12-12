<?php
namespace KapEmail\V1\Rpc\Email;

class EmailControllerFactory
{
    public function __invoke($controllers)
    {
        $appConfig = $controllers->getServiceLocator()->get('Config');
        $config = $appConfig['contact_email'];
        
        return new EmailController($config);
    }
}

<?php

namespace KapSecurity\Authentication;

use KapSecurity\Authentication\Adapter\AdapterInterface;
use KapSecurity\IdentityAuthenticationRepository;
use KapSecurity\IdentityRepository;
use KapSecurity\V1\Rest\IdentityAuthentication\IdentityAuthenticationResource;
use Zend\Authentication\Exception;
use ZF\Rest\AbstractResourceListener;

class AuthenticationService extends \Zend\Authentication\AuthenticationService {
    
    protected $options;
    protected $identityAuthenticationRepository;
    protected $identityRepository;
    
    public function __construct(Options $options, IdentityAuthenticationRepository $identityAuthenticationRepository, IdentityRepository $identityRepository)
    {
        $this->options = $options;
        $this->identityAuthenticationRepository = $identityAuthenticationRepository;
        $this->identityRepository = $identityRepository;
    }
    
    public function authenticate(AdapterInterface $adapter = null)
    {
        if (!$adapter) {
            if (!$adapter = $this->getAdapter()) {
                throw new Exception\RuntimeException('An adapter must be set or passed prior to calling authenticate()');
            }
        }
        $result = $adapter->authenticate();

        /**
         * ZF-7546 - prevent multiple successive calls from storing inconsistent results
         * Ensure storage has clean state
         */
        if ($this->hasIdentity()) {
            $this->clearIdentity();
        }

        if($result->isValid()) {
            $serviceId = $adapter->getId();
            $identity = $result->getIdentity();

            $data = array(
                'service_id' => $serviceId,
                'identity' => $identity
            );

            $res = $this->identityAuthenticationRepository->getPaginatorAdapter($data)->getItems(0, 1);
            $authEntity = $res->current();

            $identityEntity = null;
            if(!$authEntity) {
                if(!$this->options->getAllowRegistration()) {
                    $failed = new Result(Result::FAILURE_REGISTRATION_DISABLED, $identity);
                    //$failed->setUserProfile($result->getUserProfile());
                    return $failed;
                }

                $enable = $this->options->getEnableOnRegistration();

                $idData = [
                    'enabled' => $enable,
                    'authentication_enabled' => $enable,
                    'registered_time' => date('Y-m-d H:i:s')
                ];
                
                $profile = $result->getUserProfile();
                if($profile) {
                    $idData['display_name'] = $profile['displayName'];
                }
                
                $identityEntity = $this->identityRepository->create($idData);
                
                $data['owner_id'] = $identityEntity['id'];
                $authEntity = $this->identityAuthenticationRepository->create($data);
            }
            
            if(!$identityEntity) {
                $identityEntity = $this->identityRepository->find($authEntity['owner_id']);
            }
            
            if(!$identityEntity['authentication_enabled']) {
                $failed = new Result(Result::FAILURE_IDENTITY_DISABLED, $identity);
                return $failed;
            }
            
            $result->setIdentityId($authEntity['owner_id']);
            
            $this->getStorage()->write($authEntity['owner_id']);
        }
        
        return $result;
    }

} 
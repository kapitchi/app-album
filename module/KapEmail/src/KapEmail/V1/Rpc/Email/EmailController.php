<?php
namespace KapEmail\V1\Rpc\Email;

use Zend\Mvc\Controller\AbstractActionController;
use Zend\Mail;
use Zend\View\Model\JsonModel;
use Zend\Mime\Part as MimePart;
use Zend\Mime\Message as MimeMessage;

class EmailController extends AbstractActionController
{
    protected $config;
    
    public function __construct(array $config)
    {
        $this->config = $config;
    }
    
    public function emailAction()
    {
        $config = $this->config;

        $event = $this->getEvent();
        $inputFilter = $event->getParam('ZF\ContentValidation\InputFilter');
        $values = $inputFilter->getValues();
        
        $content = $event->getParam('ZFContentNegotiationParameterData');
        
        $renderer = $this->getServiceLocator()->get('ViewRenderer');
        $bodyHtml = $renderer->render('kap-email/contact', $content->getBodyParams());

        $html = new MimePart($bodyHtml);
        $html->type = "text/html";

        $body = new MimeMessage();
        $body->setParts(array($html));
        
        $mail = new Mail\Message();
        $mail->setBody($body);
        $mail->setFrom($values['email'], $values['name']);
        $mail->addTo($config['to_email'], $config['to_name']);
        $mail->setSubject($config['subject']);

        $transport = new Mail\Transport\Sendmail();
        $transport->send($mail);
        
        return new JsonModel([
            'sent' => true
        ]);
    }
}

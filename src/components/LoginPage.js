//--------------------------------------------------------------------------------------------------------------
// Programer: AFG Sarwar
// Date: 02/19/2025
// Parpuse: Login page
//--------------------------------------------------------------------------------------------------------------
import { useState } from 'react';
import { Grid, Card, Text, PasswordInput, TextInput, ActionIcon, Anchor, Button, Flex, Stack } from '@mantine/core';
import { IconUser, IconLock } from '@tabler/icons-react';

import { useNavigate, useLocation } from 'react-router-dom';
import { TOP_FIRSTRATE_LOGO } from '../svgicons/svgicons';

import { useUser } from './contexts/UserContext';
import { useAuth } from './contexts/AuthContext';

export const LoginPage = () => {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [message, setMessage] = useState('');

  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const isLogout = location.state?.logout || false; // Retrieve the logout state

  const { updateUserData } = useUser();
  const { login } = useAuth();

  const navigate = useNavigate();

  //const generateToken = () => {
  //  let array = new Uint16Array(96);
  //  window.crypto.getRandomValues(array);
  //  return Array.from(array, (byte) => ('0' + (byte & 0xFF).toString(16)).slice(-2)).join('');
  //};

  const handleLogin = async () => {
    setMessage('');
    setLoading(true);

    const data = {
      IBIC_user: user,
      IBIC_pass: pass,
      IBIWF_action: 'WF_SIGNON'
    };

    try {
      const response = await fetch('/ibi_apps/WFServlet.ibfs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        credentials: 'include', // Include credentials such as cookies
        body: new URLSearchParams(data).toString(),
      });

      if (!response.ok) {
        setMessage('The system is unavailable at this time.');
        setLoading(false);
      }

      const contentType = response.headers.get('Content-Type');
      const responseText = await response.text();
      let isXML = contentType?.includes('text/xml');
      let isHTML = contentType?.includes('text/html');

      if (isXML) {
        handleXML(responseText);
      } else if (isHTML) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(responseText, 'text/html');
        const errorMsg = doc.querySelector('div.errorMsg');

        if (errorMsg) {
          setMessage(<span style={{ color: 'red' }}>{errorMsg.textContent}</span>);
          setLoading(false);
          return;
        }
        handleHTML(responseText);
      }

    } catch (error) {
      setMessage('The system is unavailable at this time.');
      setLoading(false);
    }
  };

  const handleXML = (responseText) => {
    /*
      The following is an example of the response sent back by WF for authentication failure.
    
      <?xml version="1.0" encoding="UTF-8" standalone="no"?>
      <ibfsrpc _jt="IBFSResponseObject" <--- This is the tag we want
               language="EN"
               localizeddesc="Reporting Server Authentication Error Node=EDASERVE"
               name="WF_SIGNON"
               returncode="6001"
               returndesc="IBFSException 6001: Bad Userid" <--- This is the information we want
               subreturncode="0"
               subsystem="SSYS"
               type="simple">
        <ibfserrorvalues size="1">
          <entry key="edaNode" value="EDASERVE"/>
        </ibfserrorvalues>
      </ibfsrpc>
    */
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(responseText, 'application/xml');
    const tag = xmlDoc.querySelector('ibfsrpc');
    const code = tag.getAttribute('returncode');
    let msg = tag.getAttribute('localizeddesc');

    msg = code === '6001' ? 'Authentication failed' : msg;

    setMessage(msg);
    setLoading(false);
  };

  const handleHTML = (responseText) => {
    /* 
      The following is the response from WF after successful authentication.  We remove the IBIxdum because it's
      not necessary to the subsequent process, and we change the method property's value from "get" to "post" for
      purposes of obscurity and for browser history management.
    
      <HTML><SCRIPT type="text/javascript"></SCRIPT>
      <BODY onLoad=document.form1.submit()>
      <FORM NAME="form1" METHOD=get ACTION="/ibi_apps/WFServlet">
      <INPUT TYPE="HIDDEN" NAME="IBIxdum" VALUE="0.6014040495883997">
      <INPUT TYPE="HIDDEN" NAME="IBIF_ex" VALUE="FRPLaunch">
      <INPUT TYPE="HIDDEN" NAME="THEPROGRAM" VALUE="FRD_MAIN">
      </FORM></BODY></HTML>
    */
    setMessage('Loading...');

    setUser('');
    setPass('');

    let processedHtml = responseText;
    const lastIndex = processedHtml.lastIndexOf('<!--');
    if (lastIndex > 0) {
      processedHtml = processedHtml.substr(0, lastIndex);
    }

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = processedHtml;
    document.body.appendChild(tempDiv);

    const form = document.querySelector('form');
    if (form) {
      form.method = 'post';
      const input = form.querySelector('input[name="IBIxdum"]');
      if (input) input.remove();
    }

    setMessage('');
    //form.submit();
    //let authToken = generateToken();

    // Store the session id in localstorage
    login(user, process.env.REACT_APP_DATAENCRYPTION_PASS);
    
    updateUserData({
      userid: user,
      pass: process.env.REACT_APP_DATAENCRYPTION_PASS, // now we using cookie instead of sending user and pass
    });
    navigate('/');
  };

  return (
    <Flex direction="row" justify="center" style={{ width: '100%', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <video
        autoPlay
        muted
        loop
        id="background-video"
      >
        <source src="/images/loginBackground.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <Flex style={{ position: 'relative', zIndex: 1, alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>
        <Grid style={{ width: '65%' }}>
          <Grid.Col>
            <Card shadow="sm" padding="xs" radius="md" withBorder style={{ background: 'rgba(255, 255, 255, 0)' }}>
              <Grid style={{ height: '80vh' }} >
                <Grid.Col md={8} lg={8} style={{ background: 'url("/images/finance.jpg")', backgroundSize: 'cover' }}>
                  {/* Add any background image or content inside here */}
                  <Flex direction="row" gap="xs" mx={2}>
                    <Stack 
                      // display="flex" 
                      // flexDirection="column" 
                      mx={2}
                      style={{ 
                        border: '1px solid #C0D1C7', // Border with color
                        borderRadius: 4, // Rounded corners (optional)
                        //padding: 2, // Add some padding inside the box
                        height:120,
                        width:120,
                        marginTop:30,
                        marginLeft:10
                      }}
                    >
                      <TOP_FIRSTRATE_LOGO />

                      <Text style={{ fontSize: 16, color: "#C0D1C7", marginLeft: 20, marginTop: -20 }}>
                        FIRST RATE
                      </Text>
                    </Stack>
                  
                    {/* Third Column: PRO™ 2.0 */}
                    <Flex gap="xs" mx={2}>
                      <Text style={{ color: "#fff", fontSize: '6rem', display: 'block' }}>
                        PRO
                        <Text component="sup" style={{ fontSize: '3rem' }}>
                          &#8482;
                        </Text>{"   "}
                        2.0
                      </Text>
                    </Flex>
                  </Flex>

                </Grid.Col>
                <Grid.Col xs={12} md={4} style={{ background: 'linear-gradient(135deg, #38b6ff, #44489a)', overflow: 'auto' }}>
                  <Stack gap="xl" align="stretch" justify="center" style={{ padding: 0 }}>
                    { !isLogout ? (
                      <Text style={{color:'#ffffff', fontSize:28, textAlign: 'center' }} mb={{ base: 0, sm: 0, md: 0, lg: 220 }}>
                        Welcome Back!
                      </Text>
                    ) : (
                      <Text style={{color:'#ffffff', fontSize:14, textAlign: 'center' }} mb={{ base: 0, sm: 0, md: 0, lg: 220 }} >
                        You’ve been successfully logged out.
                      </Text>
                    )

                    }
                    
                    <form>
                      {message && (<Flex style={{ marginBottom: 20, color: 'error.main' }}>{message}</Flex>)}
                      
                      <Text style={{color:'#ffffff', fontSize:14 }}>Username</Text>
                      <Flex direction="column" gap="xs" mb={20}>
                        <TextInput
                          required
                          variant="filled"
                          radius="md"
                          icon={<ActionIcon><IconUser /></ActionIcon>}
                          value={user}
                          onChange={(e) => setUser(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleLogin();
                          }}
                          size="md"
                        />
                      </Flex>
                      
                      <Text style={{color:'#ffffff', fontSize:14 }}>Password</Text>
                      <PasswordInput
                        required
                        variant="filled"
                        size="md"
                        radius="md"
                        icon={<ActionIcon><IconLock /></ActionIcon>}
                        value={pass}
                        onChange={(e) => setPass(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleLogin();
                        }}
                      />
                      
                      <Flex direction="column" gap="xs" my={10}>
                        <Anchor color="inherit" style={{color:'#ffffff', fontSize:11, }} href={process.env.REACT_APP_FORGOT_PASSWORD_URL} target="_blank">Forgot password?</Anchor>
                      </Flex>
                        <Button fullWidth
                          size="md"
                          radius="md"
                          onClick={handleLogin}
                          disabled={!user || !pass || loading}
                          style={{
                            background: 'linear-gradient(to bottom, #9eaddd, #9eaddd)',
                            boxShadow: '0 0 5px #9eaddd',
                            transition: '0.5s',
                            '&:hover': {
                              background: 'linear-gradient(to bottom, #9eaddd, #9eaddd)', // Change hover color if needed
                              boxShadow: '0 0 5px #9eaddd, 0 0 25px #9eaddd, 0 0 50px #9eaddd, 0 0 100px #9eaddd',
                            },
                          }}
                          
                        >
                          {loading ? (
                            <>
                              <span className="spinner-border spinner-border-sm text-light" role="status" />
                              <Text style={{color:'#ffffff', fontSize:16, textTransform: 'none', boxShadow: '0 0 5px #9eaddd, 0 0 25px #9eaddd, 0 0 50px #9eaddd, 0 0 100px #9eaddd' }}>Authenticating...</Text>
                            </>
                          ) : (
                            <Text style={{color:'#ffffff', fontSize:16, textTransform: 'none'}}>Login</Text>
                          )}
                        </Button>
                    </form>
                  </Stack>
                </Grid.Col>
              </Grid>
            </Card>
          </Grid.Col>
        </Grid>
      </Flex>
    </Flex>
  );

};

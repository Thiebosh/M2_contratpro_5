import {Flex,Avatar, Wrap, WrapItem, Input, Stack, Spacer} from "@chakra-ui/react";

import './Profile.css'

export default function Profile(){

    const name = 'Benjamin';
    const password = 'ben';

    return(

        <div className='profilePage'>
            <Flex>
                <div className='avatar'>
                    <Wrap>
                        <WrapItem>
                            <Avatar size='xl' src='https://bit.ly/code-beast' />
                        </WrapItem>
                    </Wrap>
                </div>
                <div className='infos'>
                    <Stack spacing={3}>
                        <Input variant='flushed' placeholder='Name' />
                        <Input variant='flushed' placeholder='Password' />
                    </Stack>
                </div>
            </Flex>
        </div>


    )
}
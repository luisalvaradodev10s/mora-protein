import React from 'react';
import { Image } from 'react-native';

const WhatsAppCartIcon = ({ size = 44, style }) => {
  return (
    <Image
      source={require('../../assets/image-whatsapp.png')}
      style={[{ 
        width: size, 
        height: size, 
        borderRadius: 999,
        overflow: 'hidden'
      }, style]}
      resizeMode="cover"
    />
  );
};

export default WhatsAppCartIcon;

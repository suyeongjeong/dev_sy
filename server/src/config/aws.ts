import AWS from 'aws-sdk';

// AWS SNS 설정
export const configureSNS = (): AWS.SNS => {
  AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'ap-northeast-2', // 서울 리전
  });

  const sns = new AWS.SNS({ apiVersion: '2010-03-31' });
  console.log('✅ AWS SNS configured');
  return sns;
};

export const getSNS = (): AWS.SNS => {
  return configureSNS();
};

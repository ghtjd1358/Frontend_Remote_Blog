const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map',  // 프로덕션에서도 디버깅 가능 (선택사항)
  
  output: {
    filename: '[name].[contenthash].js'  // 캐시 버스팅용 해시
  },
  
  optimization: {
    splitChunks: {
      chunks: 'all'  // 코드 분할
    }
  }
});

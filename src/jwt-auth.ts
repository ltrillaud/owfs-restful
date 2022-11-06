import * as jwt from 'jsonwebtoken'
import Container from 'typedi'
import { ProfileService } from './profiles/profile-service'

const profileService = Container.get(ProfileService)

export interface IJwtPayload {
  exp: number
  nbf: number
  iat: number
  iss: string
  preferred_username: string
}

export interface IPartialRequest {
  headers?: { authorization: string }
  url: string
  ip: any
  ips?: any
}

export async function expressAuthentication(
  // action: Action,
  request: IPartialRequest,
  securityName: string,
  scopes?: string[],
): Promise<IJwtPayload> {
  return await new Promise<IJwtPayload>((resolve, reject) => {
    if (securityName === 'jwt') {
      jwtAuthentication(request).then((payload) => {
        resolve(payload)
      }).catch((err) => {
        reject(err)
      })
    } else {
      reject(new Error('securityName must be jwt'))
    }
  })
}

export async function jwtAuthentication(
  request: IPartialRequest,
): Promise<IJwtPayload> {
  return await new Promise<IJwtPayload>((resolve, reject) => {
    const now = new Date().toISOString()
    console.log(`         jwtAuth.ts JWT request on url(${request.url}) @ ${now}`)

    const authorization = request.headers?.authorization ?? ''
    if (authorization !== '') {
      try {
        const token = authorization.substring(7) // skip 'Bearer '

        // get either internal or quota
        const decoded = jwt.decode(token, { json: true })
        if (decoded !== null) {
          const secretKey = profileService.profile.jwtSecret

          // check sign, nbf and exp
          jwt.verify(token, secretKey, {
            algorithms: ['RS256'],
          }, (err, _payload) => {
            if (err !== null) {
              console.log(`         jwtAuth.ts JWT failed ${err.message} on url(${request.url}) @ ${now}`)
              reject(err)
            } else {
              resolve(_payload as IJwtPayload)
            }
          })
        } else {
          console.log(`         jwtAuth.ts JWT decode failed on url(${request.url}) with jwt(${token}) @ ${now}`)
          reject(new Error('Unable to decode JWT'))
        }
      } catch (err) {
        console.log(`         jwtAuth.ts JWT catched on url(${request.url}) @ ${now}`)
        reject(err)
      }
    } else {
      console.log(`         jwtAuth.ts JWT empty on url(${request.url}) @ ${now}`)
      reject(new Error('no JWT provided'))
    }
  })
}

import { Pipe, PipeTransform } from '@angular/core';

/** New api.realworld.show accounts have `image: ''`; fall back to the RealWorld default avatar. */
@Pipe({ name: 'avatar' })
export class AvatarPipe implements PipeTransform {
  transform(image: string | null | undefined): string {
    return image || '/default-avatar.svg';
  }
}

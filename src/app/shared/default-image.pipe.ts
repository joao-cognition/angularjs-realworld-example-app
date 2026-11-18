import { Pipe, PipeTransform } from '@angular/core';

export const DEFAULT_AVATAR = '/assets/default-avatar.svg';

@Pipe({ name: 'defaultImage' })
export class DefaultImagePipe implements PipeTransform {
  transform(image: string | null | undefined): string {
    return image || DEFAULT_AVATAR;
  }
}

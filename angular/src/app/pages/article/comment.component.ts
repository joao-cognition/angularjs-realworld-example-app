import { AvatarFallbackDirective } from '../../shared/avatar-fallback.directive';
import { DatePipe } from '@angular/common';
import { Component, computed, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Comment } from '../../core/models';
import { UserService } from '../../core/user.service';
import { AvatarPipe } from '../../shared/avatar.pipe';

@Component({
  selector: 'app-comment',
  imports: [AvatarFallbackDirective, RouterLink, DatePipe, AvatarPipe],
  template: `
    <div class="card">
      <div class="card-block">
        <p class="card-text">{{ comment().body }}</p>
      </div>
      <div class="card-footer">
        <a class="comment-author" [routerLink]="['/@' + comment().author.username]">
          <img
            appAvatar
            [src]="comment().author.image | avatar"
            class="comment-author-img"
            alt=""
          />
        </a>
        &nbsp;
        <a class="comment-author" [routerLink]="['/@' + comment().author.username]">{{
          comment().author.username
        }}</a>
        <span class="date-posted">{{ comment().createdAt | date: 'longDate' }}</span>
        @if (canModify()) {
          <span class="mod-options">
            <i class="ion-trash-a" title="Delete comment" (click)="delete.emit()"></i>
          </span>
        }
      </div>
    </div>
  `,
})
export class CommentComponent {
  readonly comment = input.required<Comment>();
  readonly delete = output<void>();

  private readonly user = inject(UserService);
  protected readonly canModify = computed(
    () => this.user.current()?.username === this.comment().author.username,
  );
}

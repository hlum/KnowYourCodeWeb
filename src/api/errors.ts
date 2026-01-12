import { ErrorType } from '../types/models';

export class LollipopError extends Error {
  constructor(
    public readonly type: ErrorType | 'unknown',
    message: string
  ) {
    super(message);
    this.name = 'LollipopError';
  }

  static validation(message: string): LollipopError {
    return new LollipopError('validation_error', message);
  }

  static auth(): LollipopError {
    return new LollipopError('auth_error', 'ログインの有効期限が切れました。再度ログインしてください。');
  }

  static forbidden(): LollipopError {
    return new LollipopError('forbidden_error', 'この操作を行う権限がありません。');
  }

  static notFound(): LollipopError {
    return new LollipopError('not_found_error', 'お探しの情報が見つかりませんでした。');
  }

  static server(): LollipopError {
    return new LollipopError('server_error', 'サーバーで問題が発生しました。しばらくしてからもう一度お試しください。');
  }

  static unsupportedRepoUrl(): LollipopError {
    return new LollipopError('unsupported_repo_url', '提出しているリポジトリのURLはサポートされていません。');
  }

  static unsupportedFileType(): LollipopError {
    return new LollipopError('unsupported_file_type', 'サポートされていないファイルタイプです。(Zipである必要があります。）');
  }

  static invalidUrl(): LollipopError {
    return new LollipopError('unknown', '接続先のURLが正しくありません。');
  }

  static noDataFound(): LollipopError {
    return new LollipopError('unknown', 'データの取得に失敗しました。');
  }
}
